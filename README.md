

# Getting started

    npx create-react-app my-app --template redux
    cd my-app
    npm install --save persistent-react-entities

# Using it in Express

- Uses a sqlite3 backend
- TODO: move away from hardcoded test.db

In a server.js file

```javascript

var express = require("express");
var app = express();
var http = require('http').createServer(app);

var { entityRouter } = require('persistent-react-entities')

const port = 8111;

// create REST API endpoint
app.use('/apiendpoint', entityRouter)

// start server
http.listen(port, '0.0.0.0', () => {
    console.log("Server running on port ", port);
});
```

For development, you may want to add the following to your package.json, to enable API access to your react app

```
  "proxy": "http://localhost:8111",
```



# Client side (React) 

- based on redux toolkit entityAdapter

Example usage

```javascript

import { configureStore } from '@reduxjs/toolkit';
import { RESTEntityAdapter }  from 'persistent-react-entities/client/RESTEntityAdapter';

export const Order = new RESTEntityAdapter("Order");
export const OrderLine = new RESTEntityAdapter("OrderLine");

// store

export default configureStore({
  reducer: {
    orders: Order.reducer,
    lineitems: OrderLine.reducer, 
  },
});

// selectors

export const getOrders = (state) => Order.selectors.selectAll(state.orders);
export const getOrderLines = (state, orderId) => OrderLine.selectors.selectAll(state.lineitems).filter(o => o.orderId === orderId);


```
