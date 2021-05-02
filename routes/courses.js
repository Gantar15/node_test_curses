const {Router} = require('express');
const Course = require('../models/course');
const router = new Router();
const auth = require('../middleware/auth');


router.get('/', async (req, res) => {
    let courses = await Course.find().populate('userId', 'email name').select('img title price');

    res.render('courses', {
        title: "Курсы",
        isCourses: true,
        courses
    });
});

router.get('/:id', async (req, res) => {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    
    res.render('course', {
        layout: 'empty',
        title: "Курс "+course.title,
        course
    });
});

router.get('/:id/edit', auth, async (req, res)=>{
    if (!req.query.allow) {
        return res.redirect('/');
    }
    const course = await Course.findById(req.params.id);

    res.render('course-edit', {
        title: `Редактирование ${course.title}`,
        course
    });
});

router.post('/edit', auth, async (req, res) => {
    const {id} = req.body;
    delete req.body.id;
    await Course.findByIdAndUpdate(id, req.body);
    res.redirect('/courses/'+id);
});

router.post('/remove', auth, async (req, resp) => {
    try{
        await Course.deleteOne({
            _id: req.body.id
        });
        resp.redirect('/courses');
    } catch(e){
        console.log(e);
    }
});

module.exports = router;