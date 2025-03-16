# Problems and Solutions

## Problem 1:
- **Description**: I tried to use mssql but I kept getting connectivity problems.
- **Solution**: Decided to test with MariaDB

## Problem 2: 
- **Description**: my repo was getting thousands of clutter files which slowed down my development IDE.
- **Solution**: I made a new repo and included .gitignore


## Problem 3: Installation mariadb
- **Description**: when using the app for production, you should allow remote connection. However, you'll need to set up SSL/TLS to encrypt the connection. Further, you should also configure your firewall to allow connections from trusted sources.
- **Solution**: For development purposes, I did not allow remote connections so that I can focus on building the app first. I will look into encrypted connection in later stages of the development.


## Problem 4: Connection to database
- **Description**: I had a problem connecting to the database. I tried different extensions and uninstalled the mssql extensions. Finally, it worked with the MySQL extension together with the appropriate driver.
- **Solution**: Use the MySQL extension and ensure the appropriate driver is installed. --> SQLTools + SQLTools MySQL/MariaDB/TiDB extensions


## Problem 5: Node.js database connection
- **Description**: I had a problem connecting Node.js to my database. The connection kept failing due to incorrect configuration.
- **Solution**: Resolved the issue by properly configuring the '.env' file with the correct database credentials.


## Problem 6: JWT (token) vs. Sessions
- **Description**: A secure way to connect between client and server. A JWT is stored on the client and would work great for cloud based services. However, I want my app to be locally based, so maybe creating sessions could be better than tokens...
- **Solution**: I think I will go with sessions since my app is locally based and it is not designed to scale its users in the thousands, so I think a normal server should be able to handle the session load without too big of a bottle-neck. Sessions are also easier to handle and can be securely managed in a local environment. With that said, I will probably recommend admins to run their copy of the app with a VPN, or at least use HTTPS (in either case https...). 