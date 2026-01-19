import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';

@Component({
  selector: 'app-snapshot-view-page',
  templateUrl: './snapshot-view-page.component.html',
  styleUrls: ['./snapshot-view-page.component.scss']
})
export class SnapshotViewPageComponent implements OnInit {

  cameraId!: string;
  fromDate!: string;
  toDate!: string;

  // full list from API
  allSnapshots: string[] = [];

  // current page list
  snapshots: string[] = [];

  loading = false;
  error = '';

  // pagination
  page = 1;
  count = 10;            // take
  totalSnapshots = 0;
  totalPages = 0;

  API_BASE_URL = environment.API_BASE_URL;

  constructor(private route: ActivatedRoute,  private location: Location,   private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.cameraId = params['cameraId'];
      this.fromDate = params['fromDate'];
      this.toDate = params['toDate'];
      this.count = Number(params['count'] || 10);

      if (this.cameraId) {
        this.loadSnapshots();
      }
    });
  }

  // ================= LOAD FROM API =================

  loadSnapshots() {

    const payload = {
      cameraId: this.cameraId,
      fromDate: this.fromDate,
      toDate: this.toDate,
      count: "10000"   // ask max possible since API has no skip
    };

    this.loading = true;
    this.error = '';

    fetch(`${this.API_BASE_URL}/api/Settings/GetSnapshots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(res => {

      console.log('Snapshot API:', res);

      this.allSnapshots = res.images || [];
      this.totalSnapshots = Number(res.totalSnapshots || 0);
      this.totalPages = Math.ceil(this.totalSnapshots / this.count);

      this.applyPagination();
      this.loading = false;
    })
    .catch(err => {
      console.error(err);
      this.error = 'Failed to load snapshots';
      this.loading = false;
    });
  }

  // ================= FRONTEND SKIP / TAKE =================

  applyPagination() {
    const skip = (this.page - 1) * this.count;
    const take = this.count;

    this.snapshots = this.allSnapshots.slice(skip, skip + take);
  }

  // ================= PAGINATION =================

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.applyPagination();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.applyPagination();
    }
  }
  goBack() {
    if (window.history.length > 1) {
      this.location.back();     // browser history back
    } else {
      this.router.navigate(['/dashboard']); // fallback
    }
  }
  
}
