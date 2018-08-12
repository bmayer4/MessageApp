import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Post } from '../models/post.model';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();
  currentPostsUpdated = this.postsUpdated.asObservable()

  constructor(private http: HttpClient, private router: Router) { }

  getPosts() {
    this.http.get<{message: string, posts: any}>('http://localhost:3000/api/posts')
    .pipe(map(postData => {
      return postData.posts.map(p => {
        return {
          title: p.title,
          content: p.content,
          id: p._id
        }
      });
    }))
    .subscribe(transformedPosts => {  //returning posts now, not object with message and posts
      this.posts = transformedPosts;
      this.postsUpdated.next([...this.posts]);  //makes copy of array 
    })
  }

  addPost(title: string, content: string) {
    const post: Post = { id: null, title: title, content: content};  //can't be null...
    this.http.post<{ message: string, postId: string }>('http://localhost:3000/api/posts', post).subscribe(responseData => {
      post.id = responseData.postId;
      this.posts.push(post);
      this.postsUpdated.next([...this.posts]);
      this.router.navigate(["/"]);
    })
  }

  getPost(id: string) {
    //return {...this.posts.find(p => p.id === id)};  //for edit page refresh we have to hit database, can't return in subscribe async method, so we have to return observable to subscribe to it in our component
    return this.http.get<{ _id: string, title: string, content: string }>(`http://localhost:3000/api/posts/${id}`);
  }                                                  


  editPost(id: string, title: string, content: string) {
    const postToUpdate = { id, title, content };
    this.http.patch(`http://localhost:3000/api/posts/${id}`, postToUpdate).subscribe(post => {
      // this.posts = this.posts.map(p => {
      //   if (p.id === id) {
      //     return { 
      //       ...p,
      //       ...post
      //     } 
      //   } else {
      //       return p
      //     }
      // })
      // this.postsUpdated.next([...this.posts]);  *****this is for editing, but we are fetching every time we load list so we don't need this
  
      this.router.navigate(["/"]);
    })
  }

  deletePost(postId: string) {
    this.http.delete(`http://localhost:3000/api/posts/${postId}`).subscribe((data) => { 
      console.log(data);
      const updatedPosts = this.posts.filter(p => p.id !== postId);
      this.posts = updatedPosts;
      this.postsUpdated.next([...this.posts]);
     });
  }

}
