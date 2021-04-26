const {Router} = require('express');
const Course = require('../models/course');
const router = new Router();


router.get('/', async (req, res) => {
    const courses = await Course.getAll();

    res.render('courses', {
        title: "Курсы",
        isCourses: true,
        courses: courses
    });
});

router.get('/:id', async (req, res) => {
    const courseId = req.params.id;
    const course = await Course.getById(courseId);
    
    res.render('course', {
        layout: 'empty',
        title: "Курс "+course.title,
        course
    });
});

router.get('/:id/edit', async (req, res)=>{
    if (!req.query.allow) {
        return res.redirect('/');
    }
    const course = await Course.getById(req.params.id);

    res.render('course-edit', {
        title: `Редактирование ${course.title}`,
        course
    });
});

router.post('/edit', async (req, res) => {
    await Course.update(req.body);
    res.redirect('/courses/'+req.body.id);
});

module.exports = router;