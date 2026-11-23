/* Все заменяемые файлы собраны здесь. Пути относительно index.html.
   Не подключайте сюда командные кухни как экранные изображения. */
window.WILLOW = {
  rooms: {
    study: 'assets/rooms/room_study.png', bedroom: 'assets/rooms/room_bedroom.png',
    kitchen: 'assets/rooms/room_kitchen.png', laundry: 'assets/rooms/room_laundry_room.png',
    library: 'assets/rooms/room_library.png', living: 'assets/rooms/room_living_room.png',
    conservatory: 'assets/rooms/room_conservatory.png'
  },
  cats: Object.fromEntries(['socks','sherlock','pudding','luna','duchess','chester','mr_muffin'].map(name => [name, `assets/cats/cat_${name}.png`])),
  manor: 'assets/tasks/08_12_People_Manor.jpeg',
  differences: ['assets/differences/picture_a.jpeg','assets/differences/picture_b.jpeg'],
  audio: 'assets/audio/listening.mp3',
  video: '', // Можно указать, например, assets/video/mr_muffin.mp4.
  artwork: { gates: '', hall: '', corridor: '', mrsWillow: '', detective: '', sleepingMuffin: '' },
  printOnly: {
    reading: 'assets/tasks/01_Mr_Muffin_Text.jpeg', trueFalse: 'assets/tasks/02_True_False.jpeg',
    questions: 'assets/tasks/03_Detective_Questions.jpeg',
    kitchenA: 'assets/tasks/Messy_Kitchen_Team_A.jpeg', kitchenB: 'assets/tasks/Messy_Kitchen_Team_B.jpeg'
  },
  // Девять наблюдаемых изменений. Цветок из старого ключа исключён: он есть на обеих картинках.
  observations: [
    ['The armchair cat', 'Picture A: He is lying in the armchair. Picture B: He is washing his face.'],
    ['The orange cat', 'Picture A: He is eating cat food. Picture B: He is drinking milk.'],
    ['The window cat', 'Picture A: She is sitting on the window sill. Picture B: She is sleeping on the window sill.'],
    ['The ball', 'Picture A: The ball is red. Picture B: The ball is blue.'],
    ['The grey cat', 'Picture A: She is in a cardboard box. Picture B: She is in a basket.'],
    ['The picture', 'Picture A: There is a bird in the picture. Picture B: There is a butterfly in the picture.'],
    ['The curtains', 'Picture A: The curtains are yellow. Picture B: The curtains are green.'],
    ['The books', 'Picture A: There is one book on the table. Picture B: There are two books on the table.'],
    ['The cushion', 'Picture A: The cushion is green. Picture B: The cushion is purple.'],
    ['Наблюдение преподавателя', 'We found another difference.']
  ]
};
