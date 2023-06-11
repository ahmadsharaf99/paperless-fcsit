from datetime import datetime

from django.core.exceptions import ValidationError
from django.db import models


class Faculty(models.Model):
    faculty_name = models.CharField(max_length=150)
    faculty_code = models.CharField(max_length=50)
    established_date = models.DateField('Establishment Date', default=datetime.now)

    class Meta:
        verbose_name_plural = 'Faculties'
        ordering = ['faculty_code']

    def __str__(self):
        return self.faculty_code


class Department(models.Model):
    dept_name = models.CharField('Department Name', max_length=150)
    dept_code = models.CharField('Department Code', max_length=50)
    established_date = models.DateField('Establishment Date', default=datetime.now)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='departments')

    def __str__(self):
        return self.dept_code

    class Meta:
        ordering = ['dept_code']


class Programme(models.Model):
    prog_name = models.CharField('Programme Name', max_length=150)
    prog_duration = models.IntegerField('Programme Duration')
    established_date = models.DateField('Establishment Date', default=datetime.now)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='programmes')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programmes')

    def __str__(self):
        return self.prog_name

    class Meta:
        ordering = ['prog_name']

    def clean(self):
        allowed_departments = Department.objects.filter(faculty=self.faculty)
        if self.department not in allowed_departments:
            raise ValidationError(
                'The department you selected is not under the chosen faculty.'
            )
