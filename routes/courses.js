const {Router} = require('express');
const Course = require('../models/course');
const router = new Router();
const auth = require('../middleware/auth');


function isOwner(course, req){
    return course.userId.toString() === req.user._id.toString();
}

router.get('/', async (req, res) => {
    try{
        let courses = await Course.find().populate('userId', 'email name').select('img title price');

        res.render('courses', {
            title: "Курсы",
            isCourses: true,
            userId: req.user?._id.toString(),
            courses
        });
    } catch(err){
        console.log(err);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId);
        
        res.render('course', {
            layout: 'empty',
            title: "Курс "+course.title,
            course
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/:id/edit', auth, async (req, res)=>{
    if (!req.query.allow) {
        return res.redirect('/');
    }

    try{
        const course = await Course.findById(req.params.id);

        if (!isOwner(course, req))
            res.redirect('/courses');

        res.render('course-edit', {
            isCourses: true,
            title: `Редактирование ${course.title}`,
            course
        });
    } catch(err){
        console.log(err);
    }
});

router.post('/edit', auth, async (req, res) => {
    try {
        const {id} = req.body;
        delete req.body.id;
        const course = await Course.findById(id);
        if (!isOwner(course, req))
                return res.redirect('/courses');

        Object.assign(course, req.body);
        await course.save();
        res.redirect('/courses/'+id);
    } catch (error) {
        console.log(error);
    }
});

router.post('/remove', auth, async (req, resp) => {
    try{
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        });

        resp.redirect('/courses');
    } catch(e){
        console.log(e);
    }
});

module.exports = router;