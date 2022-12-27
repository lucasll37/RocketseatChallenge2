const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const usernameExists = users.find(user => user.username === username)

  console.log(usernameExists)

  if(!usernameExists) {
    return response.status(404).json({ error: "Username don't exists" })
  }

  request.username = username
  
  return next()

}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const usernameAlreadyExists = users.find(user => user.username === username)
  
  if(usernameAlreadyExists) {
    return response.status(400).json({error: "Username already exists!"})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)
  return response.status(201).json(user)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const user = users.find(user => user.username === username)

  return response.send(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { username } = request.headers
  const user = users.find(user => user.username === username)

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { username } = request.headers
  const { title, deadline } = request.body
  const user = users.find(user => user.username === username)
  const todo = user.todos.find(todo => todo.id === id)
  
  if(!todo) {
    return response.status(404).json({error: "Todo don't exists!"})
  }

  Object.assign(todo, {
    title,
    deadline
  })

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { username } = request.headers
  const user = users.find(user => user.username === username)
  const todo = user.todos.find(todo => todo.id === id)

  if(!todo) {
    return response.status(404).json({error: "Todo don't exists!"})
  }

  Object.assign(todo, {
    done: true
  })

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { username } = request.headers
  const user = users.find(user => user.username === username)
  const todoExists = user.todos.find(todo => todo.id === id)

  if(!todoExists) {
    return response.status(404).json({error: "Todo don't exists!"})
  }

  user.todos = user.todos.filter(todo => todo.id !== id)

  return response.status(204).send()
});

module.exports = app;