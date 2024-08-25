import {
  DynamicFormComponent,
  ListErrorsComponent,
} from '@realworld/core/forms';
import { injectAutoSignal } from '@realworld/signals';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { ArticleEditStateService } from './article-edit-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cdt-article-edit',
  standalone: true,
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.css'],
  imports: [
    DynamicFormComponent,
    CommonModule,
    ListErrorsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleEditComponent {
  articleEditStateService = injectAutoSignal(
    ArticleEditStateService,
  );
}
