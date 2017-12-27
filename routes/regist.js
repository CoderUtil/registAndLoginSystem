const express = require('express')
const router = express.Router()
const judgeRegist = require('../apis/judgeRegist')
const useMongoose = require('../apis/useMongoose')
const model = useMongoose.getModel()
const useCrypto = require('../apis/useCrypto')

router.get('/', (req, res, next) => {
  res.status(200)
  res.type('text/html')

  req.session.usernamePass = false
  req.session.passwordPass = false
  req.session.verifyPass = false
  req.session.idPass = false
  req.session.phonePass = false
  req.session.emailPass = false

  res.render('regist.hbs')
})

router.post('/judge', async (req, res, next) => {
  res.status(200)
  res.type('application/json')
  let result = judgeRegist.checkWhetherIsEmpty(req.body, req.session)
  if (!result.success) {
    res.send(result)
    return
  }

  result = judgeRegist.checkWhetherIsFormatbale(req.body, req.session)
  if (!result.success) {
    res.send(result)
    return
  }

  try {
    result = await judgeRegist.checkWhetherIsExist(req.body, model, req.session)
  } catch (err) {
    console.log(err)
  }
  res.send(result)
})

router.post('/pass', async (req, res) => {
  res.status(200)
  res.type('application/json')

  if (!req.session.usernamePass || !req.session.passwordPass || !req.session.verifyPass 
    || !req.session.idPass || !req.session.phonePass || !req.session.emailPass) {
    res.send({'success': false})
    return 
  }

  let keyAndValue = useCrypto.encrypt(req.body.password)
  try {
    await model.create({
      'username': req.body.username,
      'password': keyAndValue.value,
      'key':      keyAndValue.key,
      'id':       req.body.id,
      'phone':    req.body.phone,    
      'email':    req.body.email
    })
  } catch (err) {
    console.log(err)
  }

  req.session.signin = true
  req.session.username = req.body.username
  res.send({'success': true}) 
})

module.exports = router