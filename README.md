# Syntax IDE

A code editor that lives in your browser. I built Syntax IDE so I could write and run code right from my phone, without installing anything. Open it, make a file, write some code, hit **Run**, and see the output right below.

It's also growing into something more social: profiles, friends, and (eventually) writing code together with someone live.

**Live:** [syntax-ide.vercel.app](https://syntax-ide.vercel.app)

---

## What it can do right now

- **Code editor** with syntax highlighting
- **Sidebar** with your files, and a language icon next to each one
- **Languages in the main editor:** syntax highlighting for Node.js, vanilla JS, C, C++ and Go
- **Run code** in the main editor: Node.js, JavaScript, C and C++ all execute (Go is highlighting only for now)
- **Output area** under the editor, so you can see results and exit codes
- **Sandbox** for front-end experiments: write HTML, CSS and JS in separate tabs and see the result live next to your code
- **Download** your current code as a file
- **Auth:** register, login and logout
- **User profile:** update your username, bio and GitHub link
- **Search users** by name
- **Auto-save:** your code is saved in local storage, so it's still there when you come back

## What's still coming

I'm building this step by step, so here's the honest list of what isn't done yet:

- [ ] Email verification
- [ ] Friend requests (send and accept)
- [ ] Delete account
- [ ] Run Go code (highlighting works, execution doesn't yet)
- [ ] Friends chat
- [ ] Post page
- [ ] Folder support
- [ ] A real terminal
- [ ] Save code in a database instead of local storage
- [ ] Live code sharing: let a friend watch you write code, if you allow it

## Work sequence

1. Editor, syntax highlighting, sidebar, language icons
2. Register, login, logout
3. User profile and user search
4. Sandbox for HTML, CSS and JS
5. Email verification, friend requests, delete account
6. Go execution, folders, terminal
7. Database storage, friends chat, post page, live code sharing

## Author

Made by **Nazmus Sadat**. See my other work at [prosadat.vercel.app](https://prosadat.vercel.app).

## License

This project is licensed under the [Apache License 2.0](LICENSE).
