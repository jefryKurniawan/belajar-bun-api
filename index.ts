import {serve} from 'bun'

const PORT= 3049;

interface Post {
    id: string;
    title: string;
    content: string;
}

let blogPosts: Post[] = [];

function handleGetAllPost() {
    return new Response(JSON.stringify(blogPosts), {
        headers:{ 'Content-Type': 'application/json'},
    }) 
}

function handleGetPostById(id: string){
    const post = blogPosts.find((post) => post.id === id)

    if (!post) {
        return new Response('Post Not Found', {status: 404})
    }

    return new Response(JSON.stringify(post), {
        headers: {'Content-Type': 'application/json'},
    });
}

function handleCreatePost(title:string, content: string) {
    const newPost: Post = {
        id: `${blogPosts.length}`,
        title,
        content,
    }

    blogPosts.push(newPost);

    return new Response(JSON.stringify(newPost), {
        headers: { 'Content-Type': 'application/json' },
        status: 201,
    })
}

function handleUpdatePost(id:string, title:string, content:string) {
    const postIndex = blogPosts.findIndex((post) => post.id === id)

    if (postIndex == -1) {
        return new Response("Post not found", {status: 404})
    }

    blogPosts[postIndex] = {
        ...blogPosts[postIndex],
        title,
        content,
    };

    return new Response("Post Update", {status: 200});
}

function handleDeletePost(id:string) {
    const postIndex = blogPosts.findIndex((post) => post.id === id)

    if (postIndex === -1) {
        return new Response("Post not found", {status: 404})
    }

    blogPosts.splice(postIndex, 1)

    return new Response("Post Deleted", {status: 200});
}
 
serve({
    port: PORT,
    async fetch(request){
        const {method} = request;
        const {pathname} =  new URL(request.url);
        const pathRegexForID = /^\/api\/posts\/(\d+)$/; 

        // GET-route to get a post by id
        if (method == 'GET') {
            const match = pathname.match(pathRegexForID);
            const id = match && match[1];

            if (id) {
                // handle getting a post by ID
                return handleGetPostById(id);
            }
        }

        // GET-route to get all post
        if (method=='GET' && pathname == '/api/posts') {
            return handleGetAllPost();
        }

        // POST-route to create a post
        if (method=='POST' && pathname == '/api/posts') {
            const newPost =  await request.json();
            return handleCreatePost(newPost.title, newPost.content);   
        }

        // PATCH-route to create a post by id
        if (method=='PATCH') {
            const match = pathname.match(pathRegexForID);
            const id = match && match[1]

            if (id) {
                // handle getting a post by ID 
                const editedPost = await request.json()
                return handleUpdatePost(id, editedPost.title, editedPost.content)
            }
        }   
        // DELETE-route to delete a post by id
        if (method=='DELETE' && pathname== '/api/posts') {
            const { id } = await request.json();
            return handleDeletePost(id);
        }

        return new Response("Not Found", {status: 404} );
    }
})

console.log(`HListening on http:localhost:${PORT} ...`);