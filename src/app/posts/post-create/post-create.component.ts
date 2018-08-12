import { Component, OnInit, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PostService } from '../../_services/post.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {

  enteredTitle = '';
  enteredContent = '';
  post: Post;
  isLoading = false;
  private mode = 'create';
  private postId: string;

  constructor(private postService: PostService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {

        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe(postData => {  //don't need to unsubscribe from observable, angular takes care of it
        this.isLoading = false;
        this.post = { id: postData._id, title: postData.title, content: postData.content }
        }, (e) => { 
          this.isLoading = false;
          console.log(e.error.message); //from server
          this.router.navigate(["/"]); 
        }); 

      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }


  onSavePost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true
     if (this.mode === 'create') {
      this.postService.addPost(form.value.title, form.value.content);
     } else {
      this.postService.editPost(this.postId, form.value.title, form.value.content);
     }
    form.resetForm();
  }
}
