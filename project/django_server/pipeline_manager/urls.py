"""django_server URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from pipeline_manager import views

urlpatterns = [
    path('projects/', views.projects),
    path('load_project/<project_id>/', views.load_project),
    path('save_project/', views.save_project),
    path('delete_project/', views.delete_project),
#     path('rename_project/', views.rename_project),
    path('produce_scripts/', views.produce_scripts),
    path('launch_scripts/', views.launch_scripts),
    path('download_scripts/', views.download_scripts),
    path('download_csv/', views.download_csv),
    path('modules/<cluster_id>/<prefix>/', views.modules),
    path('modules/<cluster_id>/', views.modules),
    path('genomes/<cluster_id>/', views.genomes),
    path('accounts/<cluster_id>/<prefix>/', views.accounts),
    path('accounts/<cluster_id>/', views.accounts),
    path('qos/<cluster_id>/', views.qos),
    path('pipelines/', views.pipelines),
    path('steps/', views.steps),
    path('templates/', views.templates),
    path('upload_samples/', views.upload_samples),
    path('add_papers/<project_id>/<bioproject_id>/', views.add_papers),
    path('upload_pipeline/', views.upload_pipeline),
    path('upload_step/<overwrite>/', views.upload_step),
    path('upload_step/', views.upload_step),
    path('create_projects/', views.create_projects),
    path('invoke_monitor/', views.invoke_monitor),
    path('test/', views.test)
]
