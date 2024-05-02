const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

let db = null

const dbPath = path.join(__dirname, 'cricketTeam.db')

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

//converting DBOject To ResponseObject

const convertDBOjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerNmae: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

//API 1 get all players
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
  SELECT *
  FROM
    cricket_team
  ORDER BY 
    player_id;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDBOjectToResponseObject(eachPlayer)),
  )
})

//API 2 add player to table
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayersQuery = `
  INSERT INTO
    cricket_team (player_name, jersey_number, role)
  VALUES
    ('${playerName}',
    ${jerseyNumber},
    '${role}'
    );`
  const dbResponse = await db.run(addPlayersQuery)
  const playerId = dbResponse.lastId
  response.send('Player Added to Team')
})

//API 3
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getplayerQuery = `
  SELECT *
  FROM
    cricket_team
  WHERE
    player_id = ${playerId};`
  const player = await db.get(getplayerQuery)
  response.send(convertDBOjectToResponseObject(player))
})

//API 4
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const playerUpdateQuery = `
  UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id = ${playerId};`
  await db.run(playerUpdateQuery)
  response.send('Player Details Updated')
})

//API 5
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDeleteQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`
  await db.run(playerDeleteQuery)
  response.send('Player Removed')
})

//export module
module.exports = app
