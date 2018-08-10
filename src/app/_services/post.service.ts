import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();
  currentPostsUpdated = this.postsUpdated.asObservable()

  constructor() { }

  getPosts() {
    return [...this.posts];  //use spread since arrays and objects are reference types
  }

  addPost(title: string, content: string) {
    const post: Post = { title: title, content: content};
    this.posts.push(post);
    this.postsUpdated.next([...this.posts]);
  }
}
