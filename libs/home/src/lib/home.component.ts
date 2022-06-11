import { Subject, switchMap, tap } from 'rxjs';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ArticlesFacade, articleListInitialState, ArticleListConfig } from '@realworld/articles/data-access';
import { AuthFacade } from '@realworld/auth/data-access';
import { CommonModule } from '@angular/common';
import { TagsListComponent } from './tags-list/tags-list.component';
import { ArticleListComponent } from '@realworld/articles/feature-articles-list/src';
import { Adapt } from '@state-adapt/ngrx';
import { getHttpSources } from '@state-adapt/core';
import { HomeService } from './home.service';
import { homeAdapter } from './home.adapter';
import { homeInitialState } from './home.model';

@UntilDestroy()
@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, TagsListComponent, ArticleListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  listConfig$ = this.articlesfacade.listConfig$;
  isAuthenticated = false;
  unsubscribe$: Subject<void> = new Subject();

  tagsRequest = getHttpSources('[Home] [Tags]', this.homeService.getTags(), res => [true, res.tags, res]);
  homeStore = this.adapt.init(['home', homeAdapter, homeInitialState], {
    setTags: this.tagsRequest.success$,
    resetTags: this.tagsRequest.error$,
  });
  tags$ = this.homeStore.tags$;

  constructor(
    private adapt: Adapt,
    private articlesfacade: ArticlesFacade,
    private authFacade: AuthFacade,
    private homeService: HomeService,
  ) {}

  ngOnInit() {
    this.authFacade.isLoggedIn$.pipe(untilDestroyed(this)).subscribe(isLoggedIn => {
      this.isAuthenticated = isLoggedIn;
      this.getArticles();
    });
  }

  setListTo(type = 'ALL') {
    this.articlesfacade.setListConfig(<ArticleListConfig>{
      ...articleListInitialState.listConfig,
      type,
    });
  }

  getArticles() {
    if (this.isAuthenticated) {
      this.setListTo('FEED');
    } else {
      this.setListTo('ALL');
    }
  }

  setListTag(tag: string) {
    this.articlesfacade.setListConfig(<ArticleListConfig>{
      ...articleListInitialState.listConfig,
      filters: {
        ...articleListInitialState.listConfig.filters,
        tag,
      },
    });
  }
}
