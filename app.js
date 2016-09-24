const DL_ICON_SRC = 'https://images.designtrends.com/wp-content/uploads/2015/12/02045154/Download-Icons38.png'
const EDIM_URL = 'https://edimension.sutd.edu.sg';

let links = $('#content_listContainer li a');

console.log('before', links);

links = links.filter(function() {
  const imgSrc = $(this).closest('li').children('img').attr('src');
  console.log($(this).closest('li').children('img'))

  return imgSrc.includes('document') || imgSrc.includes('file');
});

console.log('after', links);

links.each(function(i) {
  const url = EDIM_URL + $(this).attr('href');

  $(this).prepend(`<a href=${url} class='yp-dl' download><img src=${DL_ICON_SRC}></img></a>`)
})
