// controllers / usersController.js
const { query } = require('express')
const { options } = require('../routes/usersRouter')
const usersStorage = require('../storages/usersStorage')

exports.usersListGet = (req, res) => {
  res.render('index', {
    title: 'User list',
    users: usersStorage.getUsers(),
  })
}

exports.usersCreateGet = (req, res) => {
  res.render('createUser', {
    title: 'Create user',
  })
}

// exports.usersCreatePost = (req, res) => {
//   const { firstName, lastName } = req.body
//   usersStorage.addUser({ firstName, lastName })
//   res.redirect('/')
// }

// -----------------------------------------------------------------

// This just shows the new stuff we're adding to the existing contents
const { body, validationResult } = require('express-validator')

const alphaErr = 'must only contain letters.'
const lengthErr = 'must be between 1 and 10 characters.'

const validateUser = [
  body('firstName')
    .trim()
    .isAlpha()
    .withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`First name ${lengthErr}`),
  body('lastName')
    .trim()
    .isAlpha()
    .withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`Last name ${lengthErr}`),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email must be an valid email-adress'),
  body('age')
    .optional({ values: 'falsy' })
    .trim()
    .isInt({ min: 18, max: 120 })
    .withMessage('Age must only contain numbers'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Bio must have max. 200 characters.'),
]

// We can pass an entire array of middleware validations to our controller.
exports.usersCreatePost = [
  validateUser,
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).render('createUser', {
        title: 'Create user',
        errors: errors.array(),
      })
    }
    const { firstName, lastName, email, age, bio } = req.body
    usersStorage.addUser({ firstName, lastName, email, age, bio })
    res.redirect('/')
  },
]

// ----------------------------------------------------------------

exports.usersUpdateGet = (req, res) => {
  const user = usersStorage.getUser(req.params.id)
  res.render('updateUser', {
    title: 'Update user',
    user: user,
  })
}

exports.usersUpdatePost = [
  validateUser,
  (req, res) => {
    const user = usersStorage.getUser(req.params.id)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).render('updateUser', {
        title: 'Update user',
        user: user,
        errors: errors.array(),
      })
    }
    const { firstName, lastName } = req.body
    usersStorage.updateUser(req.params.id, { firstName, lastName })
    res.redirect('/')
  },
]

// --------------------------------------------------------------

// Tell the server to delete a matching user, if any. Otherwise, respond with an error.
exports.usersDeletePost = (req, res) => {
  usersStorage.deleteUser(req.params.id)
  res.redirect('/')
}

// --------------------------------------------------------------
exports.usersSearchGet = (req, res) => {
  const email = req.query.search
  const user = usersStorage.getUsers().find((item) => item.email === email)

  // console.log(user)
  if (user === undefined) {
    return res.render('search', {
      title: `User not found`,
      user: undefined,
    })
  }

  res.render('search', {
    title: `${user.firstName} ${user.lastName}`,
    user: user,
  })
}
