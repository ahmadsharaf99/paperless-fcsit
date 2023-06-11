class StudentUploadTo:
    def __init__(self, name):
        self.name = name
        self.img_path = ''

    def __call__(self, instance, filename):
        reg = instance.student.username
        safe_reg_num = reg.replace('/', '_')
        self.img_path = f'students/{safe_reg_num}/{self.name}.jpg'
        return self.img_path

    def deconstruct(self):
        return ('students.models.StudentUploadTo', [self.img_path], {})
