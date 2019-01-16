const fs = require('fs')

class Database {
    constructor () {
        this.db = {}
        this.model = 'data-model.json'
        this.databaseDirectory = '.'
    }

    open (path = 'db.json') {
        this.path = this.databaseDirectory + '/' + path
        
        let attatch = ''
        try {
            if (!fs.existsSync(this.path))
                if (!fs.existsSync(this.path + '.sav'))
                    this.writeModel()
                else
                    attatch = '.sav'
            
            this.load = fs.readFileSync(this.path + attatch, {encoding: 'utf-8'})
        } catch (e) {
            throw new Error('Error reading database')
        }
        
        try {
            this.db = JSON.parse(this.load)
        } catch (e) {
            throw new Error('Corrupted database')
        }

        if (attatch)
            this.save(true)

        return this.db
    }

    save (restore = false) {
        try {
            if (!restore) {
                fs.writeFileSync(this.path + '.sav', JSON.stringify(this.db, null, 2))
                fs.unlinkSync(this.path)
            }
            fs.renameSync(this.path + '.sav', this.path)
        } catch (e) {
            if (e instanceof TypeError)
                throw e
            
            throw new Error('Error writtng to database')
        }
    }

    createBackup (dbName) {
        let date = new Date
        let filename = dbName+"_"+date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"-"+date.getTime()+".json"

        try {
            fs.writeFileSync('backups/'+filename, JSON.stringify(this.db))
        } catch (e) {
            if (e instanceof TypeError)
                throw e
            
            throw new Error('Error writtng to database')
        }

        return filename
    }
    
    writeModel () {
        let model

        try {
            model = fs.readFileSync(this.model, {encoding: 'utf-8'})
        } catch (e) {
            throw new Error('Error reading database model')
        }

        try {
            fs.writeFileSync(this.path, model)
        } catch (e) {
            throw new Error('Error writting to database')
        }

        this.load = model
        console.log('Created new database: ' + this.path)
    }
}

module.exports = new Database()