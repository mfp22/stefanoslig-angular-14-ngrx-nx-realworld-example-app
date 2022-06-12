import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';

@Component({
  selector: 'app-list-errors',
  standalone: true,
  templateUrl: './list-errors.component.html',
  styleUrls: ['./list-errors.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListErrorsComponent {
  @Input() set errors(e: { [index: string]: string }) {
    this._errors = Object.keys(e || {}).map(key => `${key} ${e[key]}`);
    this.changeDetectorRef.markForCheck();
  }
  _errors: string[] = [];

  constructor(private changeDetectorRef: ChangeDetectorRef) {}
}
