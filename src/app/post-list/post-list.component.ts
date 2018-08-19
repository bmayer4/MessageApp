import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';
import { Post } from '../models/post.model';
import { PostService } from '../_services/post.service';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
 posts: Post[] = [];
 isLoading = false;
 totalPosts = 0;
 postsPerPage = 2;
 currentPage = 1;
 pageSizeOptions = [1, 2, 5, 10];
 isAuth: boolean = false;
 userId: string;
 private postsSub: Subscription;
 private authSub: Subscription;

  constructor(private postService: PostService, private authService: AuthService) { }

  ngOnInit() {
    this.isLoading = true;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
    this.postsSub = this.postService.getPostUpdateListener().subscribe((postData: { posts: Post[]; postCount: number }) => {
      this.isLoading = false;
      this.totalPosts = postData.postCount;
      this.posts = postData.posts;
    });
    this.isAuth = this.authService.getIsAuth();  //because listener in this component is loaded after we log in, listener doesn't give previous value
    this.authSub = this.authService.getAuthStatusListener().subscribe(isAuth => { 
      this.isAuth = isAuth ;
      this.userId = this.authService.getUserId();
    });
    this.userId = this.authService.getUserId();
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;  //pageIndex is 0 based
    this.postsPerPage = pageData.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authSub.unsubscribe();
  }
  
  onDelete(postId: string) {
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    }, err => {
      this.isLoading = false;
    });
  }


}
