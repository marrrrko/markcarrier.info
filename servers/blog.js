const mount = require('koa-mount')
const serve = require('koa-static')
const send = require('koa-send')
const Koa = require('koa')
const _ = require('lodash')
const fs = require('fs-extra')
const frontMatter = require('front-matter')
const marked = require('marked')

const srcDir = __dirname + "/../writings-src"
const remote = "https://github.com/MarkCarrier/public-writings.git"

module.exports = async function startBlogServer(port) {

    const posts = await loadPosts()

    return new Promise(function(resolve, reject) {
        try {
            let app = new Koa()
            app.use(mount('/src', serve(srcDir)))
            app.use(async (ctx, next) => {  
                ctx.type = 'html';              
                ctx.body = posts[0].html                
            })
            app.listen(port, resolve)
        } catch(err) {
            console.error(err)
            reject(err)
        }
    })
}

async function loadPosts() {
    const postFiles = await loadPostsFromSource()
    const posts = postFiles.map(postfile => frontMatter(postfile))

    return posts.map(post => {
        return {
            ...post,
            html: marked(post.body)
        }
    })
}

async function loadPostsFromSource() {
    const filenames = await loadSrcFiles()
    const markdownFilenames = filenames.filter(f => f.endsWith(".md"))
    const markdownFileLoads = markdownFilenames.map(async f => {
        return fs.readFile(`${srcDir}/${f}`, 'utf-8')
    })

    return Promise.all(markdownFileLoads)
}

async function loadSrcFiles() {    
    const srcDirExists = await fs.exists(srcDir)
    if(!srcDirExists) {
        await fs.mkdir(srcDir)
    }
    const git = require('simple-git/promise')(srcDir)        
    let files = await fs.readdir(srcDir)
    if(!files.length) {
        await git.clone(remote, srcDir)
        files = await fs.readdir(srcDir)
    } else {
        await git.pull()
    }

    return files
}