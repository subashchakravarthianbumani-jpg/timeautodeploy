import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { GeneralService } from 'src/app/_services/general.service';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-live-viewer',
  templateUrl: './live-viewer.component.html',
  styleUrls: ['./live-viewer.component.scss'],
})
export class LiveViewerComponent implements OnInit, AfterViewInit {

  // Header
  header = {
    division: '',
    district: '',
    workId: '',
    status: '',
    updated: '',
  };

  cameras: any[] = [];
  currentIndex = 0;
  isSingleCamera = false;

  currentStream = 'main';
  isPlayback = false;
  currentPlaybackId: string | null = null;

  streamList: string[] = [];
  divList: string[] = [];
  distList: string[] = [];
  workList: string[] = [];
  statList: string[] = [];

  camCount = 0;

  safeBaseUrl = environment.apiUrl.replace(/\/api\/?$/, '').trim();
  API_BASE_URL = environment.API_BASE_URL;

  slidePrev!: HTMLElement | null;
  slideNext!: HTMLElement | null;
  closeBtn!: HTMLElement | null;
  boxes: HTMLElement[] = [];
  resBtns: HTMLElement[] = [];

  constructor(
    private state: GeneralService,
    private location: Location,
    private messageService: MessageService,
      private router: Router
  ) {}

  // ================= INIT =================

  ngOnInit() {
    this.cameras = this.state.cameras || [];
    this.currentIndex = this.state.selectedIndex || 0;
    this.isSingleCamera = this.cameras.length === 1;
  }

  ngAfterViewInit() {
    const stateData = this.state.getState?.();
    if (!stateData || !Array.isArray(stateData.cameras) || !stateData.cameras.length) {
      console.error('LiveViewer: no camera data in service state');
      return;
    }

    const cams = stateData.cameras;

    this.currentIndex =
      typeof stateData.selectedIndex === 'number'
        ? stateData.selectedIndex
        : cams.findIndex(c => c.rtmpUrl && c.rtmpUrl.trim() !== '');

    if (this.currentIndex === -1) this.currentIndex = 0;

    this.streamList = cams.map((c: any) =>
      c.rtmpUrl && c.rtmpUrl.trim() !== '' ? c.rtmpUrl : c.rtspUrl || ''
    );

    this.divList = cams.map((c: any) => c.divisionName || '');
    this.distList = cams.map((c: any) => c.districtName || '');
    this.workList = cams.map((c: any) => c.tenderNumber || '');
    this.statList = cams.map((c: any) => c.workStatus || '');

    this.camCount = this.streamList.length;

    this.slidePrev = document.getElementById('slidePrev');
    this.slideNext = document.getElementById('slideNext');
    this.closeBtn = document.querySelector('.close-btn');
    this.boxes = Array.from(document.querySelectorAll('.cam-box')) as HTMLElement[];
    this.resBtns = Array.from(document.querySelectorAll('.res-btn')) as HTMLElement[];

    // Initial load
    this.setSingleLiveStream(this.currentIndex);
    this.bindControls();
  }

  // ================= HEADER =================

  updateHeader() {
    const top = document.querySelector('.top-info-bar');
    if (!top) return;

    const spans = top.querySelectorAll('span');
    spans[0].textContent = 'Division: ' + (this.divList[this.currentIndex] || '');
    spans[1].textContent = 'District: ' + (this.distList[this.currentIndex] || '');
    spans[2].textContent = 'Work ID: ' + (this.workList[this.currentIndex] || '');
    spans[3].textContent = 'Status: ' + (this.statList[this.currentIndex] || '');
  }

  hideUnusedCameras() {
    this.boxes.forEach((b, i) => {
      b.style.display = i < this.camCount ? 'block' : 'none';
    });
  }

  // ================= STREAM LOGIC =================

  getLiveUrl(i: number, type: string) {
    const base = this.streamList[i] || '';

    if (base.startsWith('rtmp://')) return base;

    if (type === 'sub') return base.replace(/\.264$/, '_third.264');
    if (type === 'third') return base.replace(/\.264$/, '_fourth.264');

    return base;
  }

  setSingleLiveStream(index: number) {
    const isRTMP = (this.streamList[index] || '').startsWith('rtmp://');

    this.resBtns.forEach(b => {
      b.style.pointerEvents = isRTMP ? 'none' : 'auto';
      b.style.opacity = isRTMP ? '0.5' : '1';
    });

    const rtsp = this.getLiveUrl(index, this.currentStream);
    const url = `${this.safeBaseUrl}/api/settings/live?rtspUrl=${encodeURIComponent(rtsp)}`;

    const img = document.getElementById('cam01') as HTMLImageElement;
    if (img) img.src = url;

    this.updateHeader();
  }

  getActiveChannel() {
    return this.currentIndex + 1;
  }

  // ================= CONTROLS =================

  bindControls() {

if (this.slideNext) {
  this.slideNext.onclick = () => {

    // 🔥 stop any playback before sliding
    if (this.isPlayback) {
      this.stopPlaybackVideo();
    }

    this.currentIndex = (this.currentIndex + 1) % this.camCount;
    this.setSingleLiveStream(this.currentIndex);
  };
}

if (this.slidePrev) {
  this.slidePrev.onclick = () => {

    // 🔥 stop any playback before sliding
    if (this.isPlayback) {
      this.stopPlaybackVideo();
    }

    this.currentIndex = (this.currentIndex - 1 + this.camCount) % this.camCount;
    this.setSingleLiveStream(this.currentIndex);
  };
}

this.resBtns.forEach(btn => {
  btn.onclick = () => {

    if (this.isPlayback) {
      this.stopPlaybackVideo();   // 🔥 stop playback first
    }

    const base = this.streamList[this.currentIndex] || '';
    if (base.startsWith('rtmp://')) return;

    this.resBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    this.currentStream = btn.dataset['stream'] || 'main';
    this.setSingleLiveStream(this.currentIndex);
  };



});


    const pbBtn = document.getElementById('pbBtn');
    if (pbBtn) pbBtn.onclick = () => this.initPlaybackDefaults();

    const pbCancel = document.getElementById('pbCancel');
    if (pbCancel) pbCancel.onclick = () => this.closePlayback();

    const pbOk = document.getElementById('pbOk');
    if (pbOk) pbOk.onclick = () => this.handlePlaybackSubmit();


      const snapBtn = document.getElementById('snapBtn');
if (snapBtn) snapBtn.onclick = () => this.openSnapshotPopup();

const snapCancel = document.getElementById('snapCancel');
if (snapCancel) snapCancel.onclick = () => this.closeSnapshotPopup();

const snapOk = document.getElementById('snapOk');
if (snapOk) snapOk.onclick = () => this.submitSnapshots();
  }

openSnapshotPopup() {
  document.getElementById('snapshotPopup')?.classList.remove('hide');
}

closeSnapshotPopup() {
  document.getElementById('snapshotPopup')?.classList.add('hide');
}

submitSnapshots() {

  const date = (document.getElementById('snapDate') as HTMLInputElement).value;
  const from = (document.getElementById('snapFrom') as HTMLInputElement).value;
  const to   = (document.getElementById('snapTo') as HTMLInputElement).value;
  const count = (document.getElementById('snapCount') as HTMLInputElement).value;

  if (!date || !from || !to) {
    alert('Select date and time');
    return;
  }

  const cameraId = this.streamList[this.currentIndex].split('/').pop();

  this.closeSnapshotPopup();

  this.router.navigate(['/snap-shots'], {
    queryParams: {
      cameraId: cameraId,
      fromDate: date + 'T' + from + ':00',
      toDate: date + 'T' + to + ':00',
      count: count
    }
  });
}





  // ================= PLAYBACK =================

  initPlaybackDefaults() {
    const pbModal = document.getElementById('playbackPopup');
    pbModal?.classList.remove('hide');

    const pbDate = document.getElementById('pbDate') as HTMLInputElement;
    const pbFrom = document.getElementById('pbFrom') as HTMLInputElement;
    const pbTo = document.getElementById('pbTo') as HTMLInputElement;

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentTime = hh + ':' + mm;

    pbDate.value = today;
    pbDate.max = today;

    pbFrom.max = currentTime;
    pbTo.max = currentTime;

    const past = new Date(now.getTime() - 10 * 60000);
    pbFrom.value =
      String(past.getHours()).padStart(2, '0') + ':' +
      String(past.getMinutes()).padStart(2, '0');

    pbTo.value = currentTime;
  }

  closePlayback() {
    const pbModal = document.getElementById('playbackPopup');
    pbModal?.classList.add('hide');
  }

handlePlaybackSubmit() {
  const pbDate = (document.getElementById('pbDate') as HTMLInputElement).value;
  const pbFrom = (document.getElementById('pbFrom') as HTMLInputElement).value;
  const pbTo = (document.getElementById('pbTo') as HTMLInputElement).value;

  if (!pbDate || !pbFrom || !pbTo) {
    alert('Select Date and Time');
    return;
  }

  const now = new Date();
  const fromDT = new Date(pbDate + 'T' + pbFrom + ':00');
  const toDT   = new Date(pbDate + 'T' + pbTo   + ':00');

  // if (fromDT > now) {
  //   alert('From time cannot be in the future');
  //   return;
  // }

  // if (toDT > now) {
  //   alert('To time cannot be in the future');
  //   return;
  // }

  // if (toDT < fromDT) {
  //   alert('To time must be after From time');
  //   return;
  // }

  const dtFmt = pbDate.replace(/-/g, '');
  const from = pbFrom.replace(/:/g, '') + '00';
  const to = pbTo.replace(/:/g, '') + '00';

  this.setPlaybackForChannel(this.getActiveChannel(), dtFmt, from, to);

  // mark playback active
  this.isPlayback = true;

  // disable quality buttons
  this.resBtns.forEach(b => b.style.pointerEvents = 'none');

  // close popup
  const pbModal = document.getElementById('playbackPopup');
  pbModal?.classList.add('hide');

   this.setStatus('Playback');
}

setPlaybackForChannel(ch: number, dtFmt: string, from: string, to: string) {

  const baseStream = this.streamList[ch - 1] || '';

  // ✅ Always use cam01 in single view
  const img = document.getElementById('cam01') as HTMLImageElement;
  const video = document.getElementById('cam01Video') as HTMLVideoElement;

  if (!img || !video) {
    console.error('Playback elements not found');
 
    return;
  }

  /* ================= RTMP PLAYBACK ================= */
  if (baseStream.startsWith('rtmp://')) {

    img.style.display = 'none';
    video.style.display = 'block';

    const camName = baseStream.split('/').pop();

    const startTime =
      dtFmt.substring(0, 4) + '-' +
      dtFmt.substring(4, 6) + '-' +
      dtFmt.substring(6, 8) + 'T' +
      from.substring(0, 2) + ':' +
      from.substring(2, 4) + ':00';

    const endTime =
      dtFmt.substring(0, 4) + '-' +
      dtFmt.substring(4, 6) + '-' +
      dtFmt.substring(6, 8) + 'T' +
      to.substring(0, 2) + ':' +
      to.substring(2, 4) + ':00';

    fetch(`${this.API_BASE_URL}/api/Settings/playback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cameraId: camName,
        startTime: startTime,
        endTime: endTime
      })
    })
    .then(r => {
      if (!r.ok) throw new Error('Playback not found');
      return r.json();
    })
 .then(res => {
  this.currentPlaybackId = res.data.playbackId;
  video.src = res.data.videoUrl;
  video.load();
  video.muted = true;
  video.style.display = 'block';
  img.style.display = 'none';

  video.play();

  // Enable editor-like drag & resize
  setTimeout(() => {
    this.enableDragAndResize();
  }, 500);
})
    .catch(err => {
      console.error('Playback error', err);
          this.messageService.add({
    severity: 'error',
    summary: 'Error',
    life: 8000,
    detail: 'No recording found for selected time',
  });
      this.restoreToLive();
    });

    return;
  }

  /* ================= RTSP PLAYBACK ================= */

  video.pause();
  video.src = '';
  video.style.display = 'none';
  img.style.display = 'block';

  const pbURL =
    'rtsp://admin:Admin%401234@43.252.94.42:8554/recording' +
    '?ch=' + ch +
    '&stream=1&start=' + dtFmt + from +
    '&stop=' + dtFmt + to;

  img.src = `${this.safeBaseUrl}/api/settings/live?rtspUrl=${encodeURIComponent(pbURL)}`;
}


restoreToLive() {
  this.isPlayback = false;

  const img = document.getElementById('cam01') as HTMLImageElement;
  const video = document.getElementById('cam01Video') as HTMLVideoElement;

  if (video) {
    video.pause();
    video.src = '';
    video.style.display = 'none';
  }

  if (img) img.style.display = 'block';

  this.currentStream = 'main';
  this.setSingleLiveStream(this.currentIndex);

  this.resBtns.forEach(b => b.style.pointerEvents = 'auto');
  this.setStatus('Live');
}

setStatus(text: string) {
  const dot = document.querySelector('.live-dot');
  if (!dot) return;

  const next = dot.nextSibling as Text;
  if (next) {
    next.textContent = ' ' + text;
  }
}


stopPlaybackVideo() {
  const videos = document.querySelectorAll('video');

  videos.forEach((v: any) => {
    v.pause();
    v.currentTime = 0;
    v.src = '';
    v.load();
    v.style.display = 'none';
  });

  const imgs = document.querySelectorAll('.cam-box img');
  imgs.forEach((img: any) => img.style.display = 'block');

  this.isPlayback = false;
  this.currentPlaybackId = null;

  // restore UI
  this.resBtns.forEach(b => b.style.pointerEvents = 'auto');
  this.setStatus('Live');
}



enableDragAndResize() {
  const wrapper = document.getElementById('videoWrapper') as HTMLElement;
  const handle = wrapper.querySelector('.resize-handle') as HTMLElement;

  let isDragging = false;
  let isResizing = false;
  let offsetX = 0;
  let offsetY = 0;

  // Drag video
  wrapper.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    isDragging = true;
    offsetX = e.clientX - wrapper.offsetLeft;
    offsetY = e.clientY - wrapper.offsetTop;
    wrapper.classList.add('video-floating');
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      wrapper.style.left = e.clientX - offsetX + 'px';
      wrapper.style.top = e.clientY - offsetY + 'px';
    }

    if (isResizing) {
      wrapper.style.width = e.clientX - wrapper.offsetLeft + 'px';
      wrapper.style.height = e.clientY - wrapper.offsetTop + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
  });

  // Resize
  handle.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    isResizing = true;
  });
}



  // ================= NAV =================

  goBack() {
    if (this.isPlayback) { 
      this.restoreToLive();
   if (this.currentPlaybackId) {
    fetch(`${this.API_BASE_URL}/api/settings/playback/${this.currentPlaybackId}`, {
      method: 'DELETE'
    })
    .then(() => console.log('Playback deleted:', this.currentPlaybackId))
    .catch(err => console.warn('Delete playback failed', err));
  }
      return;
    }


    sessionStorage.removeItem('liveViewerReloaded');
    this.location.back();
  }
}
