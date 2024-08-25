import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  ArticleListStateService,
  ArticlesSources,
} from '@realworld/articles/data-access';
import { injectAutoSignal } from '@realworld/signals';
import { PagerComponent } from '@realworld/ui/components';
import { ArticleListItemComponent } from './article-list-item/article-list-item.component';

@Component({
  selector: 'cdt-article-list',
  standalone: true,
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.css'],
  imports: [
    CommonModule,
    ArticleListItemComponent,
    PagerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListComponent {
  articleList = injectAutoSignal(ArticleListStateService);
  articlesSources = inject(ArticlesSources);

  constructor(
    private readonly store: Store,
    private readonly router: Router,
  ) {}

  navigateToArticle(slug: string) {
    this.router.navigate(['/article', slug]);
  }
}
