import { Component, OnInit, EventEmitter } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';

import { PostService } from '../../_services/post.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Post } from '../../models/post.model';
import { mimeType } from './mime-type.validator';

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
  form: FormGroup;
  imagePreview: string | any;
  mode = 'create';
  private postId: string;

  constructor(private postService: PostService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {

    this.form = new FormGroup({
      title: new FormControl(null, { validators: [Validators.required, Validators.minLength(3)] }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {     //don't need to bind to input tag (not displaying, don't want to show errors)
        validators: [Validators.required], 
        asyncValidators: [mimeType], 
      }) 
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {

        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe(postData => {  //don't need to unsubscribe from observable, angular takes care of it
        this.isLoading = false;
        this.imagePreview = postData.imagePath;
        this.post = { id: postData._id, title: postData.title, content: postData.content, imagePath: postData.imagePath };  
        this.form.setValue({ title: this.post.title, content: this.post.content, image: this.post.imagePath });  //lets us override initial values set in new FormGroup
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


  // onSavePost(form: NgForm) {
  //   if (form.invalid) {
  //     return;
  //   }
  //   this.isLoading = true
  //    if (this.mode === 'create') {
  //     this.postService.addPost(form.value.title, form.value.content);
  //    } else {
  //     this.postService.editPost(this.postId, form.value.title, form.value.content);
  //    }
  //   form.resetForm();
  // }

  //reactive forms
  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true
     if (this.mode === 'create') {
      this.postService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
     } else {
      this.postService.editPost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
     }
    this.form.reset();
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file});  //allows you to target a single control (setValue allows you to tareget all)
    this.form.get('image').updateValueAndValidity()  //runs validator on the input
   
    const reader = new FileReader();  //create reader
    reader.onload = () => {           //define something to happen when its done loading a file
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);      //instruct it to load that file, loeads to onload async function being fired
  }

}
