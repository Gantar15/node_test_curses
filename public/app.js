function rublesFormat(text){
    return new Intl.NumberFormat('ru-RU', {
        currency: 'rub',
        style: 'currency'
    }).format(text);
}

document.querySelectorAll('.price').forEach(node => {
    node.textContent = rublesFormat(node.textContent);
});

const $card = document.getElementById('card');
if($card){
    $card.addEventListener('click', ev => {
        const target = ev.target;
        if(target.classList.contains('card-delete')){
            const id = target.dataset.id;

            fetch('/card/remove/' + id, {
                method: 'DELETE',
                headers: {
                    'X-XSRF-TOKEN': target.dataset.csrf
                }
            }).then(resp => resp.json())
            .then(card => {
                if(card.courses.length){
                    const htmlCode = card.courses.reduce((res, course) => {
                        return res + `
                            <tr>
                                <td>${course.title}</td>
                                <td>${course.count}</td>
                                <td>
                                    <button class="btn btm-small card-delete orange" data-id="${course.id}">Удалить</button>
                                </td>
                            </tr>
                        `; 
                    }, '');

                    $card.querySelector('.main_body').innerHTML = htmlCode;
                    $card.querySelector('.price').innerText = rublesFormat(card.price);
                }
                else{
                    $card.innerHTML = '<p>Корзина пуста</p>';
                }
            });
        }
    });
}


const toDate = date => {
    return new Intl.DateTimeFormat('ru-RU', {
        day: "numeric",
        weekday: "long",
        year: "numeric",
        month: "long"
    }).format(date);
};

const dates = document.querySelectorAll('.date');
dates.forEach($date => {
    $date.textContent = toDate(Date.parse($date.textContent));
});


var instance = M.Tabs.init(document.querySelectorAll('.tabs'));