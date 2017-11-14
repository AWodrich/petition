var util = require('./database.js')


app.get('/update', (req, res)=>{
    util.getStuff()
        .then(data => {
            res.render('update', {
                layout: 'main'
            })
        })
})

//=========================================
export getStuff = function(){

    const q = `Select from users…`;
    const params = [email, id, sdflksa]
    return db.query(q, params)
        .then(results=> {
                console.log(results.rows[0]) //rows is ALWAYS an array
        })



}
