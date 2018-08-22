import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Post } from '../models/post.model';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], postCount: number }>();

  constructor(private http: HttpClient, private router: Router) { }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{ message: string, posts: any, maxPosts: number }>(BACKEND_URL + queryParams)
    .pipe(map(postData => {
      return { posts: postData.posts.map(p => {
        return {
          title: p.title,
          content: p.content,
          id: p._id,
          imagePath: p.imagePath,
          creator: p.creator
        }
      }),
      maxPosts: postData.maxPosts };
    }))
    .subscribe(transformedPostsData => { 
      console.log(transformedPostsData);
      this.posts = transformedPostsData.posts;
      this.postsUpdated.next({ 
        posts: [...this.posts], //makes copy of array, good practice here not to pass pointer
        postCount: transformedPostsData.maxPosts });  
    })
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    //const post: Post = { id: null, title: title, content: content};  //can't send a file with json
    const postData = new FormData();  //js object which allows us to combine text and blobs (files)
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);  //third arg is file name to be saved on backend

    this.http.post<{ message: string, post: Post }>(BACKEND_URL, postData).subscribe(responseData => {
      //const post: Post = { id: responseData.post.id, title: title, content: content, imagePath: responseData.post.imagePath };
      // this.posts.push(post);
      // this.postsUpdated.next({ posts: [...this.posts]});  //going back to list where page is reloaded
      this.router.navigate(["/"]);
    })
  }

  getPost(id: string) {
    //return {...this.posts.find(p => p.id === id)};  //for edit page refresh we have to hit database, can't return in subscribe async method, so we have to return observable to subscribe to it in our component
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, creator: string }>(BACKEND_URL + `${id}/`);
  }                                                  


  editPost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
   if (typeof(image) === 'object') {  //file will be an object
      postData = new FormData();
    postData.append('id', id);
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
   } else {
      postData = { id, title, content, imagePath: image, creator: null }
   }
    this.http.patch(BACKEND_URL + `${id}/`, postData).subscribe(post => {
      this.router.navigate(["/"]);
    })
  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + `${postId}/`);
  }

}
