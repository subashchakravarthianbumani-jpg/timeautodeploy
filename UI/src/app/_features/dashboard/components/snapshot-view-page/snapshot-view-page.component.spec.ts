import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnapshotViewPageComponent } from './snapshot-view-page.component';

describe('SnapshotViewPageComponent', () => {
  let component: SnapshotViewPageComponent;
  let fixture: ComponentFixture<SnapshotViewPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SnapshotViewPageComponent]
    });
    fixture = TestBed.createComponent(SnapshotViewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
