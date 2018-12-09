import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, PatternValidator } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { NGXLogger } from 'ngx-logger';
import { Utils } from '../../Utils/utils';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profileForm: FormGroup;
  internationalNamePattern = "[a-zA-Z ]*";//^[a-zA-Z]";//àáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u';
  simpleEmailRegex = '^\S+@\S+$';
  g: Observable<number>;

  invalidControlNameLogged = false;

  constructor(private logger: NGXLogger) { }

  ngOnInit() {
    this.CreateForm();
  }

  CreateForm(): void {
    this.profileForm = new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.pattern(this.internationalNamePattern)]),
      lastName: new FormControl('', [Validators.required, Validators.pattern(this.internationalNamePattern)]),
      email: new FormControl('', [Validators.pattern(this.simpleEmailRegex)])
    });

    this.profileForm.controls['firstName'].valueChanges
      .debounceTime(800)
      .distinctUntilChanged()
      .subscribe(
        p => {
          // console.log(p);
          if (!this.profileForm.controls['firstName'].invalid) {
            //     console.log('ok');
          } else {

            //  console.log(this.profileForm.controls['firstName'].errors);
          }
        }

      );
  }

  public submitProfile(): void {
  }

  public getError(controlName: string): string {
    switch (controlName) {
      case 'firstName':
        {
          return 'First name is required';
        }
      case 'lastName':
        {
          return 'Surname is required';
        }
      default:
        {
          if (!this.invalidControlNameLogged) {
            this.invalidControlNameLogged = true;
            this.logger.error(`ProfileComponent:  Unrecognized control name ${controlName}`);
          }
          return null;
        }
    }

  }

  public isInError(controlName: string): boolean {
    if (Utils.IsNullOrUndefined(this.profileForm.controls[controlName])) {
      if (!this.invalidControlNameLogged) {
        this.invalidControlNameLogged = true;
        this.logger.error('ProfileComponent: Unrecognized control name ${controlName}');
      }
      return false;
    }

    return this.profileForm.controls[controlName].invalid && !this.profileForm.controls[controlName].pristine;
  }
}
