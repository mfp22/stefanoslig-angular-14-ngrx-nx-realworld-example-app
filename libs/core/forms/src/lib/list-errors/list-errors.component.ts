import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'cdt-list-errors',
  standalone: true,
  templateUrl: './list-errors.component.html',
  styleUrls: ['./list-errors.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListErrorsComponent {
  @Input() errors: string[] = [];
}
