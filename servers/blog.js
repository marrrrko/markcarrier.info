const mount = require('koa-mount')
const serve = require('koa-static')
const send = require('koa-send')
const Koa = require('koa')
const _ = require('lodash')
const fs = require('fs-extra')
const frontMatter = require('front-matter')
const marked = require('marked')
const mustache = require('mustache');
const sass = require('node-sass');

const srcDir = __dirname + "/../writings-src"
const remote = "https://github.com/MarkCarrier/public-writings.git"
const sassSrc = "./mini-mark.scss"

module.exports = async function startBlogServer(port) {

    const css = await buildCSS()
    const posts = await loadPosts()

    return new Promise(function(resolve, reject) {
        try {
            let app = new Koa()
            app.use(mount('/post/images', serve(srcDir + "/images")))
            app.use(async (ctx, next) => {
                if(ctx.path == "/style.css") {
                    ctx.type = 'text/css'              
                    ctx.body = css.css
                } else {
                    await next()
                }
            })
            app.use(async (ctx, next) => {
                const posturl = ctx.path.replace("/post/","").toUpperCase()
                const matchedPost = posts[posturl]
                if(ctx.path.startsWith("/post/") && matchedPost) {                    
                    ctx.type = 'text/html';              
                    ctx.body = mustache.render(postTemplate, { title: matchedPost.attributes.title, html: matchedPost.html})          
                } else {
                    ctx.status = 404
                    ctx.body = "Post not found"
                }
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

    const urlPosts = posts.map(post => {
        return post.attributes.urls.map(url => {
            return {
                url: url.toUpperCase(),
                ...post,
                html: marked(post.body)
            }
        })    
    })

    return _.flatten(urlPosts)
    .reduce((dict, post) => {
        dict[post.url] = post
        return dict
    }, {})

}

async function buildCSS() {
    return new Promise(function(resolve, reject) {
        sass.render({
            file: sassSrc    
        }, (err, result) => {
            if(err)
                reject(err)
            else
                resolve(result)
        })
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

const postTemplate = `
<html>
<head>
    <title>{{title}}</title>
    <link href="https://fonts.googleapis.com/css?family=Crimson+Text&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Spartan&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Work+Sans&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Dosis&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/style.css">
</head>    
    <br /><br />
    <div class="container">    
        <div class="row">
            <div class="col-sm-0 col-md-1 col-lg-2"></div>
            <div class="col-sm-12 col-md-10 col-lg-8">{{{html}}}</div>
            <div class="col-sm-0 col-md-1 col-lg-2"></div>
        </div>
    </div>
    <br /><br /><br />
</html>
`
