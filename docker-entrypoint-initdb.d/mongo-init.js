db.createUser(
    {
        user: "dexscreener",
        pwd: "dexscreener",
        roles: [
            {
                role: "dbOwner",
                db: "dexscreener"
            }
        ]
    }
);