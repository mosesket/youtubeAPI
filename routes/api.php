<?php

use App\Http\Controllers\YouTubeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::get('/list-videos', [YouTubeController::class, 'index']);
Route::get('/video-details', [YouTubeController::class, 'show']);
Route::get('/video-comments', [YouTubeController::class, 'comments']);
