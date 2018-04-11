const fse = require('fs-extra');
const fs = require('fs');
const path = require('path');
const readdir = require('recursive-readdir-sync');
const readFileTree = require('directory-tree');

const docDir = path.join(__dirname, '../../docs');
const sidebarFile = path.join(__dirname, '../../_sidebar.md');

module.exports = () => {
    // 确认有 _sidebar.md
    fse.ensureFileSync(sidebarFile);

    const ab2link = (absolutePath) => {
        const relativePath = absolutePath.replace(path.join(__dirname, '../..') + '/', '');
        return relativePath.replace(/\.md$/i, '');
    };

    const content = [];
    const tree = readFileTree(docDir, { exclude: /(node_modules)|(readme\.md)|(\/_iframe)/i, extensions: /\.md$/ });

    const getTabBlank = (absolutePath) => {
        const relativePath = absolutePath.replace(docDir, '');
        const arr = relativePath.split('/');
        const count = arr.length;

        let blank = '';
        for (let i = 1; i < count; i++) {
            blank += '  ';
        }

        return blank;
    };

    const insertContent = (tree) => {
        if (docDir !== tree.path) {
            let blank = getTabBlank(tree.path);

            if (tree.type === 'directory') {
                content.push(`${blank}+ [${tree.name.replace(/\.md$/, '')}](${ab2link(tree.path)}/)`); // 目录的链接多了一个 /
            } else {
                content.push(`${blank}+ [${tree.name.replace(/\.md$/, '')}](${ab2link(tree.path)})`);
            }
        }

        if (tree.children && tree.children.length) {
            tree.children.forEach((childTree) => {
                insertContent(childTree);
            });
        }
    };

    insertContent(tree);

    fs.writeFileSync(sidebarFile, content.join('\n'));
};