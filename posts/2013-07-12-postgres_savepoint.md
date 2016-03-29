---
layout: post
title: Postgres savepoint
tags: [database, postgres, python]
---

### Postgres savepoint and try/catch

I ran into a simple, but necessary bit of postgres knowledge this week while using a bloom filter to purge outdated database entries. The problem I encountered was within a try/catch block. I was catching a `ForeignKeyError` if the deletion of a row failed. Since I was doing this transaction within a cursor, I would get an error along the lines of: `"Current transaction is aborted, commands ignored until end of transaction block"`

<!--more-->

### The fix
Fortunately, to fix this you just add a savepoint within the try block to rollback to in case of an exception. I'll give a bit of an example.

``` python
query = 'declare myc cursor for select * from tableToCheck'
```

You need to declare a cursor name (in this case 'myc') for the transaction to use.

<script src="https://gist.github.com/tippenein/5986823.js"></script>
