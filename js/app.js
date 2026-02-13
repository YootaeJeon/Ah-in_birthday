// ========== Flower Rain Animation ==========
function createFlowerLeaves() {
  const container = document.getElementById('flower-rain');
  for (let i = 0; i < 12; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'flower-leaf';

    const fallDelay = (12 * Math.random()) + 's';
    const shakeDelay = (3 * Math.random()) + 's';
    const shakeDegree = (360 * Math.random()) + 'deg';
    const leftPosition = (100 * Math.random()) + '%';
    const translateX = (60 * Math.random() + 20) + 'px';
    const fallDuration = (7 * Math.random() + 9) + 's';
    const shakeDuration = (1 * Math.random() + 2) + 's';

    leaf.style.setProperty('--fall-delay', fallDelay);
    leaf.style.setProperty('--shake-delay', shakeDelay);
    leaf.style.setProperty('--shake-degree', shakeDegree);
    leaf.style.setProperty('--left-position', leftPosition);
    leaf.style.setProperty('--translate-x', translateX);
    leaf.style.setProperty('--fall-duration', fallDuration);
    leaf.style.setProperty('--shake-duration', shakeDuration);

    const num = Math.floor(5 * Math.random() + 1);
    leaf.innerHTML = '<img src="./img/floral-leaf/floral-leaf-' + num + '.png" alt="">';
    container.appendChild(leaf);
  }
}

// ========== Gallery Carousel ==========
var gallery = {
  curPos: 0,
  startX: 0,
  slides: null,
  track: null,
  slideWidth: 166, // 150px + 16px margin
  totalImages: 8
};

function initGallery() {
  gallery.track = document.querySelector('.gallery-track');
  gallery.slides = document.querySelectorAll('.gallery-slide');
  if (!gallery.track || !gallery.slides.length) return;

  gallery.track.addEventListener('touchstart', function(e) {
    gallery.startX = e.touches[0].pageX;
  });

  gallery.track.addEventListener('touchend', function(e) {
    var diff = gallery.startX - e.changedTouches[0].pageX;
    if (Math.abs(diff) > 30) {
      if (diff > 0) {
        galleryNext();
      } else {
        galleryPrev();
      }
    }
  });

  // 클릭: active면 라이트박스, 아니면 해당 슬라이드로 이동
  gallery.slides.forEach(function(slide, index) {
    slide.addEventListener('click', function() {
      if (slide.classList.contains('active')) {
        openLightbox(index);
      } else {
        goToSlide(index);
      }
    });
  });

  goToSlide(0);
}

function goToSlide(index) {
  if (index < 0 || index >= gallery.totalImages) return;
  gallery.curPos = index;

  var offset = -(index * gallery.slideWidth);
  gallery.track.style.transform = 'translateX(' + offset + 'px)';

  gallery.slides.forEach(function(slide, i) {
    slide.classList.remove('active', 'adjacent');
    if (i === index) {
      slide.classList.add('active');
    } else if (Math.abs(i - index) === 1) {
      slide.classList.add('adjacent');
    }
  });

  updateDots();
}

function galleryPrev() {
  if (gallery.curPos > 0) goToSlide(gallery.curPos - 1);
}

function galleryNext() {
  if (gallery.curPos < gallery.totalImages - 1) goToSlide(gallery.curPos + 1);
}

function updateDots() {
  var dots = document.querySelectorAll('.gallery-dots .dot');
  dots.forEach(function(dot, index) {
    dot.classList.toggle('active', index === gallery.curPos);
  });
}

// ========== Supabase Guestbook ==========
var SUPABASE_URL = 'https://imilvjpgejjknyoaxorp.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_kIfSnTJYMWRJ0ujtW4MdZg_gAIHlkbO';
var supabase = null;

function initSupabase() {
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
}

function submitGuestMessage() {
  var name = document.getElementById('guest-name').value.trim();
  var message = document.getElementById('guest-message').value.trim();

  if (!name) {
    alert('이름을 입력해주세요.');
    return;
  }
  if (!message) {
    alert('메시지를 입력해주세요.');
    return;
  }

  if (!supabase) {
    alert('방명록 서비스에 연결할 수 없습니다.');
    return;
  }

  var btn = document.querySelector('.guestbook-btn.submit');
  btn.disabled = true;
  btn.textContent = '보내는 중...';

  supabase.from('guestbook').insert([{
    name: name,
    message: message
  }]).then(function(result) {
    btn.disabled = false;
    btn.textContent = '축하 남기기';

    if (result.error) {
      alert('메시지 저장에 실패했습니다. 다시 시도해주세요.');
      return;
    }

    document.getElementById('guest-name').value = '';
    document.getElementById('guest-message').value = '';
    document.getElementById('char-count').textContent = '0';
    loadMessages();
  });
}

function loadMessages() {
  if (!supabase) return;

  supabase.from('guestbook')
    .select('*')
    .order('created_at', { ascending: false })
    .then(function(result) {
      if (result.error) return;
      renderMessages(result.data);
    });
}

function renderMessages(messages) {
  var container = document.getElementById('guestbook-messages');
  if (!container) return;

  if (!messages || messages.length === 0) {
    container.innerHTML = '<p class="guestbook-empty">아직 메시지가 없어요.<br>첫 번째 축하 메시지를 남겨주세요!</p>';
    return;
  }

  var html = '';
  messages.forEach(function(msg) {
    var date = new Date(msg.created_at);
    var dateStr = date.getFullYear() + '.' +
      String(date.getMonth() + 1).padStart(2, '0') + '.' +
      String(date.getDate()).padStart(2, '0');

    html += '<div class="message-card">' +
      '<div class="message-header">' +
        '<span class="message-name">' + escapeHtml(msg.name) + '</span>' +
        '<span class="message-date">' + dateStr + '</span>' +
      '</div>' +
      '<p class="message-text">' + escapeHtml(msg.message) + '</p>' +
    '</div>';
  });

  container.innerHTML = html;
}

function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function initGuestbook() {
  var textarea = document.getElementById('guest-message');
  var counter = document.getElementById('char-count');
  if (textarea && counter) {
    textarea.addEventListener('input', function() {
      counter.textContent = textarea.value.length;
    });
  }

  initSupabase();
  loadMessages();
}

// ========== Map Navigation ==========
function openNaverMap() {
  window.location.href = 'nmap://search?query=부천 부일로 223 연그리다&appname=yootaejeon.github.io/Ah-in_birthday';
}

function openKakaoMap() {
  window.location.href = 'kakaomap://search?q=부천 부일로 223 연그리다';
}

function openTmap() {
  window.location.href = 'tmap://search?name=부천 부일로 223 연그리다';
}

function openKakaoTaxi() {
  window.location.href = 'https://t.kakao.com/launch?type=taxi&dest_lat=37.4888739&dest_lng=126.7552879&ref=localweb';
}

// ========== Scroll Animation ==========
function initScrollAnimation() {
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1
  });

  document.querySelectorAll('[data-animate]').forEach(function(el) {
    observer.observe(el);
  });
}

// ========== Kakao Map ==========
function initKakaoMap() {
  if (typeof kakao === 'undefined' || !kakao.maps) return;

  kakao.maps.load(function() {
    var container = document.getElementById('kakao-map');
    if (!container) return;

    var options = {
      center: new kakao.maps.LatLng(37.4888739, 126.7552879),
      level: 3
    };

    var map = new kakao.maps.Map(container, options);

    var markerPosition = new kakao.maps.LatLng(37.4888739, 126.7552879);
    var marker = new kakao.maps.Marker({ position: markerPosition });
    marker.setMap(map);

    var infowindow = new kakao.maps.InfoWindow({
      content: '<div style="padding:5px;font-size:12px;font-family:Cafe24Oneprettynight,cursive;text-align:center;">연 그리다</div>'
    });
    infowindow.open(map, marker);
  });
}

// ========== D-Day Counter ==========
function updateDday() {
  var el = document.getElementById('dday-counter');
  if (!el) return;

  var birthday = new Date('2026-02-15T12:00:00+09:00');
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  birthday.setHours(0, 0, 0, 0);

  var diff = Math.ceil((birthday - today) / (1000 * 60 * 60 * 24));

  if (diff > 0) {
    el.innerHTML = '아인이의 첫돌까지 <span class="dday-num">' + diff + '</span>일';
  } else if (diff === 0) {
    el.innerHTML = '오늘은 아인이의 <span class="dday-num">첫돌</span>입니다!';
  } else {
    el.innerHTML = '아인이의 첫돌 <span class="dday-num">+' + Math.abs(diff) + '</span>일';
  }
}

// ========== Background Music ==========
var bgMusic = null;
var musicBtn = null;
var musicStarted = false;

function initMusic() {
  bgMusic = document.getElementById('bg-music');
  musicBtn = document.getElementById('music-btn');

  // 사용자 첫 터치/클릭 시 자동 재생 시도
  function startMusic() {
    if (musicStarted) return;
    musicStarted = true;
    bgMusic.volume = 0.4;
    bgMusic.play().then(function() {
      musicBtn.classList.add('playing');
      musicBtn.classList.remove('paused');
    }).catch(function() {
      musicBtn.classList.add('paused');
    });
    document.removeEventListener('touchstart', startMusic);
    document.removeEventListener('click', startMusic);
  }

  document.addEventListener('touchstart', startMusic, { once: true });
  document.addEventListener('click', startMusic, { once: true });
}

function toggleMusic() {
  if (!bgMusic) return;
  if (bgMusic.paused) {
    bgMusic.play();
    musicBtn.classList.add('playing');
    musicBtn.classList.remove('paused');
  } else {
    bgMusic.pause();
    musicBtn.classList.remove('playing');
    musicBtn.classList.add('paused');
  }
}

// ========== Lightbox ==========
var lightboxIndex = 0;
var lightboxImages = [
  './gallery/ah-in 1.jpg',
  './gallery/ah-in 2.jpg',
  './gallery/ah-in 3.jpg',
  './gallery/ah-in 4.jpg',
  './gallery/ah-in 5.jpg',
  './gallery/ah-in 6.jpg',
  './gallery/ah-in 7.jpg',
  './gallery/ah-in 8.jpg'
];

function openLightbox(index) {
  lightboxIndex = index;
  var lb = document.getElementById('lightbox');
  var img = document.getElementById('lightbox-img');
  img.src = lightboxImages[index];
  document.getElementById('lightbox-index').textContent = index + 1;
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('lightbox-close')) return;
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}

function lightboxPrev(e) {
  if (e) e.stopPropagation();
  if (lightboxIndex > 0) openLightbox(lightboxIndex - 1);
}

function lightboxNext(e) {
  if (e) e.stopPropagation();
  if (lightboxIndex < lightboxImages.length - 1) openLightbox(lightboxIndex + 1);
}

function initLightbox() {
  var lb = document.getElementById('lightbox');
  var startX = 0;
  lb.addEventListener('touchstart', function(e) {
    startX = e.touches[0].pageX;
  });
  lb.addEventListener('touchend', function(e) {
    var diff = startX - e.changedTouches[0].pageX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) lightboxNext();
      else lightboxPrev();
    }
  });
}

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', function() {
  createFlowerLeaves();
  initGallery();
  initScrollAnimation();
  initKakaoMap();
  updateDday();
  initMusic();
  initLightbox();
  initGuestbook();
});
