import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ArticleListStateService } from '@realworld/articles/data-access';
import { ArticleListComponent } from '@realworld/articles/feature-articles-list/src';
import { injectAutoSignal } from '@realworld/signals';
import { TagsListComponent } from './tags-list/tags-list.component';

@UntilDestroy()
@Component({
  selector: 'cdt-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    CommonModule,
    TagsListComponent,
    ArticleListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  articleList = injectAutoSignal(ArticleListStateService);
}
