<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'post_id',
        'user_id',
        'content',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * リレーションシップ: 投稿
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * リレーションシップ: ユーザー
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * コメント作成時に投稿のコメント数を更新
     */
}
