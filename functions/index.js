const functions = require('firebase-functions')
const AccessToken = require('twilio').jwt.AccessToken

const config = functions.config

exports.twilio = functions.https.onRequest((req, res) => {
  const VideoGrant = AccessToken.VideoGrant

  const twilioAccountSid = config().twilio.account // ACxxxxxxxxxx
  const twilioApiKey = config().twilio.sid // 'SKxxxxxxxxxx'
  const twilioApiSecret = config().twilio.secret

  const identity = req.body.identity

  const videoGrant = new VideoGrant({
    room: req.body.room
  })

  const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret)
  token.addGrant(videoGrant)
  token.identity = identity

  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Headers', '*')

  res.json({
    token: token.toJwt()
  })
})
