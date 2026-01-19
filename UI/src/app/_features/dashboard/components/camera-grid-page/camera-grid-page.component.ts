import { Component } from '@angular/core';
import { CameraFilter } from 'src/app/_models/dashboard.model';
import { ActivatedRoute } from '@angular/router';
import { AppLayoutComponent } from 'src/app/layout/app.layout.component';

@Component({
  selector: 'app-camera-grid-page',
  templateUrl: './camera-grid-page.component.html',
  styleUrls: ['./camera-grid-page.component.scss']
})
export class CameraGridPageComponent {

    filters: CameraFilter = {};
    filterCount = 0;


    //   constructor(private route: ActivatedRoute) {
    // this.route.queryParams.subscribe(params => {

    //   this.filters = {
    //     workStatus: params['Status'] || '',
    //   };
    // });

      constructor(private route: ActivatedRoute, public layout: AppLayoutComponent) {
    this.route.queryParams.subscribe(params => {

      this.filters = {
        divisionId: '',
        districtId: '',
        mainCategory: '',
        subCategory: '',
        tenderNumber: '',
        workStatus: params['Status'] || ''
      };

      console.log(' Filters loaded from URL:', this.filters);
    });
  }

  updateFilters(filters: CameraFilter) {
    console.log(' Grid Page received filters:', filters);

    // trigger child reload
    this.filters = { ...filters };
  }


  updateFilterCount(count: number) {
  this.filterCount = count;
   this.layout.updateFilterCount(count);
  console.log('🎯 Active filter count:', count);
}

}
