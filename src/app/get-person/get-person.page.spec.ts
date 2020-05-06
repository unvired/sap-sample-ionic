import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GetPersonPage } from './get-person.page';

describe('GetPersonPage', () => {
  let component: GetPersonPage;
  let fixture: ComponentFixture<GetPersonPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetPersonPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GetPersonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
