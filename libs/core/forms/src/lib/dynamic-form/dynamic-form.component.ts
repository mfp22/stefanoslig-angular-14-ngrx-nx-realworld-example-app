import { Field } from '../+state/forms.interfaces';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import {
  UntilDestroy,
  untilDestroyed,
} from '@ngneat/until-destroy';
import { CommonModule } from '@angular/common';
import { DynamicFieldDirective } from './dynamic-field.directive';

@UntilDestroy()
@Component({
  selector: 'cdt-dynamic-form',
  standalone: true,
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFieldDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormComponent implements OnChanges {
  @Input() structure: Field[] = [];
  @Input() data: any;
  @Input() touchedForm = false;
  @Output() updateForm: EventEmitter<any> = new EventEmitter();
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges) {
    if ('structure' in changes) {
      const structure = changes['structure'].currentValue;
      this.form = this.group(structure);
      this.listenFormChanges(this.form);
    }
    if ('data' in changes) {
      const data = changes['data'].currentValue;
      this.form.patchValue(data, { emitEvent: false });
    }
    if ('touchedForm' in changes) {
      const touchedForm = changes['touchedForm'].currentValue;
      if (!touchedForm && !!this.form) {
        this.form.reset();
      }
    }
  }

  private group = (structure: Field[]): FormGroup => {
    const group = this.fb.group({});
    structure.forEach((field) =>
      group.addControl(field.name, this.control(field)),
    );
    return group;
  };

  private control = (field: Field): FormControl => {
    return this.fb.control('', field.validator);
  };

  private listenFormChanges(form: FormGroup) {
    form.valueChanges
      .pipe(debounceTime(100), untilDestroyed(this))
      .subscribe((changes: any) =>
        this.updateForm.emit(changes),
      );
  }
}
