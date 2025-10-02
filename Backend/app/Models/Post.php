<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'user_id',
        'content',
        'image_path',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * リレーションシップ: コメント
     */
    public function comments()
    {
        return $this->hasMany(Comment::class)->orderBy('created_at', 'desc');
    }

    /**
     * リレーションシップ: ユーザー
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * コメント数更新
     */
    public function incrementComments()
    {
        $this->increment('comments_count');
    }
    public function decrementComments()
    {
        $this->decrement('comments_count');
    }
}
