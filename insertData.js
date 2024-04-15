const mysql = require('mysql2')

const pool = mysql.createPool({
  host: 'localhost',
  port: '8811',
  user: 'root',
  password: 'truong911',
  database: 'Test4',
})

const bathSize = 100000 //So raw insert moi lan
const totalRecord = 10_000_000 //Tong so raw insert
let currentId = 1 //So raw da insert
console.time('::: Time to insert data :::')
const insertData = async () => {
  const value = []
  for (let i = 0; i < bathSize && currentId <= totalRecord; i++) {
    value.push([
      currentId + 100000,
      `name ${currentId}`,
      currentId,
      `address ${currentId}`,
    ])
    currentId++
  }
  if (!value.length) {
    console.timeEnd('::: Time to insert data :::')
    pool.end((err) => {
      if (err) {
        console.log(err)
      } else {
        console.log('End connection')
      }
    })
    return
  }

  pool.query(
    'INSERT INTO test_table (id, name, age, address) VALUES ?',
    [value],
    async (err, results) => {
      if (err) {
        console.log(err)
      } else {
        console.log('Insert success')
      }
      console.log(`insert ${results.affectedRows} record`)
      await insertData()
    },
  )
}
insertData().catch((err) => {
  console.log(err)
})
