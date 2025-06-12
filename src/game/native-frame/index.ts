window.app.onEnterFullScreen(() => {
  document.getElementById('frame-bar').style.display = 'none';
});

window.app.onLeaveFullScreen(() => {
  document.getElementById('frame-bar').style.display = 'flex';
});
