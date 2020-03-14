const mount = require('koa-mount')
const serve = require('koa-static')
const moment = require('moment')
const Koa = require('koa')
const _ = require('lodash')
const fs = require('fs-extra')
const frontMatter = require('front-matter')
const marked = require('marked')
const renderer = new marked.Renderer();
renderer.link = function(href, title, text) {
    const link = marked.Renderer.prototype.link.apply(this, arguments);
    return link.replace("<a","<a target='_blank'");
}
marked.setOptions({ renderer: renderer })
const mustache = require('mustache');
const sass = require('node-sass');

const srcDir = __dirname + "/../writings-src"
const remote = "https://github.com/MarkCarrier/public-writings.git"
const sassSrc = "./mini-mark.scss"
let postData = null

module.exports = async function startBlogServer(port) {

    const css = await buildCSS()
    postData = await loadPostData()
    setInterval(reloadPosts, 15 * 1000 * 60)

    return new Promise(function(resolve, reject) {
        try {
            let app = new Koa()
            app.use(mount('/post/images', serve(srcDir + "/images")))
            app.use(async (ctx, next) => {
                if(ctx.path == "/api/health" && ctx.method == "GET") {
                    ctx.body = {
                        healthy: true
                    }
                } else if(ctx.path == "/style.css") {
                    ctx.type = 'text/css'              
                    ctx.body = css.css
                } else {
                    await next()
                }
            })
            app.use(async (ctx, next) => {
                const posturl = ctx.path.replace("/post/","").toUpperCase()
                
                let matchedPost = postData.postsById[posturl]
                const matchedUrlPostId = postData.postIdsByUrl[posturl]
                if(!matchedPost && matchedUrlPostId) {
                    matchedPost = postData.postsById[matchedUrlPostId]
                    if(!matchedPost.indexed) //Only indexed posts can be accessed by url
                        matchedPost = null
                }            
                
                if(ctx.path.startsWith("/post/") && matchedPost && matchedPost.published) {                    
                    ctx.type = 'text/html';              
                    ctx.body = matchedPost.html          
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

function reloadPosts() {
    loadPostData()
    .then(function(updatedPosts) {
        postData = updatedPosts
    })
}

async function loadPostData() {
    const postFiles = await loadPostsFromSource()
    const posts = postFiles.map(postfile => frontMatter(postfile))
    const postsById = posts.reduce(
        (dict, post) => ({
            ...dict,
            [post.attributes.id.toUpperCase()]: { 
                ...post.attributes,
                html: mustache.render(postTemplate, { 
                    ...post.attributes,
                    dateString: moment(post.attributes.date).format("MMMM Do YYYY"),
                    html: marked(post.body)})
            }}),
        {})

    const urlGroups = Object.values(postsById)
        .map(p => p.urls.map(u => ({ 
            url: u.toUpperCase(),
            postId: p.id.toUpperCase()
        })))
    const urls = _.flatten(urlGroups)
    const postIdsByUrl = urls.reduce(
        (dict, urlIdMapping) => ({
            ...dict,
            [urlIdMapping.url]: urlIdMapping.postId
        }),
        {})

    return {
        postsById,
        postIdsByUrl
    }
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
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css?family=Spartan|Crimson+Text&display=swap" rel="stylesheet">    
        <link rel="stylesheet" href="/style.css">
        {{^indexed}}
        <meta name="robots" content="noindex">
        {{/indexed}}
    </head>
    <body>
        <div class="page-line"></div>
        <div class="container">            
            <div class="row"><br /></div>
            <div class="row">
                <div class="col-sm-0 col-md-2 col-lg-3"></div>
                <div class="col-sm-12 col-md-8 col-lg-6">
                    <div class="side-note">
                        <div>{{dateString}}</div><br />
                    </div>
                    <div class="side-note">
                        <div>by {{author}}</div>
                    </div>
                    <h1>{{title}}</h1>
                    {{{html}}}
                </div>
                <div class="col-sm-0 col-md-2 col-lg-3"></div>
            </div>
        </div>
        <br /><br /><br />
    </body>
</html>
`
