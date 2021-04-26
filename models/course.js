const {v4 : uuid} = require('uuid');
const fs = require('fs');
const path = require('path');
const { rejects } = require('assert');

class Course{
    constructor(title, price, img){
        this.title = title;
        this.price = price;
        this.img = img;
        this.id = uuid();
    }

    static async update(course){
        const courses = await Course.getAll();
        const index = courses.findIndex(crs => crs.id === course.id);

        courses[index] = course;

        return new Promise(resolve => {
            fs.writeFile(path.resolve(
                __dirname, '..', 'data', 'courses.json'),
                JSON.stringify(courses),
                err => {
                    if(err) throw err;

                    resolve();
                }
            );
        });
    }

    async save(){
        const courses = await Course.getAll();
        courses.push(this.toJSON());

        return new Promise(resolve => {
            fs.writeFile(path.resolve(
                __dirname, '..', 'data', 'courses.json'),
                JSON.stringify(courses),
                err => {
                    if(err) throw err;

                    resolve();
                }
            );
        });
    }

    toJSON(){
        return {
            title: this.title,
            price: this.price,
            img: this.img,
            id: this.id
        };
    }

    static getAll(){
        return new Promise((resolve, reject) => {
            fs.readFile(
                path.resolve(__dirname, '..', 'data', 'courses.json'), 
                'utf8',
                (err, data) => {
                    if(err) throw err;

                    resolve(JSON.parse(data));
                }   
            );
        });
    }

    static async getById(id){
        const courses = await Course.getAll();
        return courses.find(course => course.id === id);
    }
}

module.exports = Course;