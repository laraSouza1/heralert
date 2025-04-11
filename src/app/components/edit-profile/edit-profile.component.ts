import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-edit-profile',
  imports: [ButtonModule,
    MessageModule,
    TextareaModule,
    FileUploadModule,
    InputIcon,
    IconField,
    ReactiveFormsModule,
    NgIf],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent {

  formGroup!: FormGroup;
  isSubmitting = false;
  usernameFormatError = false;
  usernameSpaceError = false;
  usernameLengthError = false;
  usernameMaxLengthError = false;
  usernameAlreadyUsed = false;
  nameLengthError = false;
  nameMaxLengthError = false;
  user: any;

  @Output() formDataChanged = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.user = storedUser;

    this.formGroup = this.fb.group({
      name: [storedUser.name || '', [Validators.required, Validators.maxLength(25)]],
      username: [storedUser.username || '', [Validators.required, Validators.maxLength(15)]],
      bio: [storedUser.bio || ''],
      profile_pic_url: [storedUser.profile_pic_url || ''],
      cover_pic_url: [storedUser.cover_pic_url || '']
    });

    this.formGroup.get('name')?.valueChanges.subscribe(value => this.validateName(value));
    this.formGroup.get('username')?.valueChanges.subscribe(() => this.validateUsername());
  }

  validateName(value: string) {
    const nameControl = this.formGroup.get('name');
    if (nameControl?.touched || nameControl?.dirty) {
      this.nameLengthError = value.length < 3;
      this.nameMaxLengthError = value.length > 25;
    }
  }

  emitFormData() {
    if (this.formGroup.valid) {
      this.formDataChanged.emit(this.formGroup.value);
    }
  }

  validateUsername() {
    const username = this.formGroup.get('username')?.value || '';
    console.log('Validando username:', username);

    this.usernameFormatError = false;
    this.usernameSpaceError = false;
    this.usernameLengthError = false;
    this.usernameMaxLengthError = false;
    this.usernameAlreadyUsed = false;

    if (username.length > 0) {
      this.usernameFormatError = !/^[A-Za-z0-9._]+$/.test(username);
      this.usernameSpaceError = /\s/.test(username);
      this.usernameLengthError = username.length < 3;
      this.usernameMaxLengthError = username.length > 15;

      if (!this.usernameFormatError && !this.usernameSpaceError && !this.usernameLengthError && !this.usernameMaxLengthError) {
        this.checkUsernameAvailability(username);
      }
    }
  }

  checkUsernameAvailability(username: string) {
    if (username === this.user?.username) {
      console.log('Mesmo username do usuário logado, ignorando checagem');
      this.usernameAlreadyUsed = false;
      return;
    }

    this.http.get(`http://localhost:8085/api/check-username/${username}`).subscribe({
      next: (response: any) => {
        console.log('Resposta da API:', response);
        this.usernameAlreadyUsed = response.exists;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao verificar username:', err);
        this.usernameAlreadyUsed = false;
        this.cd.detectChanges();
      }
    });
  }

  onFileSelect(event: any, type: 'profile' | 'cover') {
    const file = event.files[0];
    console.log(`Arquivo selecionado para ${type}:`, file);
  }

}
