const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data', 
    'card.json'
);

module.exports = class Card{
    static async add(course){
        const card = await Card.fetch();

        const index  = card.courses.findIndex(crs => crs.id === course.id);
        const cond = card.courses[index];

        if(cond){
            cond.count++;
            card.courses[index] = cond;
        } else{
            card.courses.push(course);
        }

        card.price += +course.price;

        return new Promise((resolve, reject) => {
            fs.writeFile(p, JSON.stringify(card), err => {
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    static async fetch(){
        return new Promise((resolve, reject) => {
            fs.readFile(p, 'utf-8', (err, content)=>{
                if(err) reject(err);
                resolve(JSON.parse(content));
            });
        });
    }
}